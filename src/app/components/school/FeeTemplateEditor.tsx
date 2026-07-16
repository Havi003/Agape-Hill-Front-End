import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FilePenLine, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import schoolLogo from '../../imports/school_logo.png';
import * as api from '../../../services/FeeApi';

const GROUPS = [
  { key: 'ECD_NURSERY', label: 'ECD NURSERY', defaultFees: 4500, porridge: 1000, exams: 400 },
  { key: 'LOWER_PRIMARY', label: 'LOWER PRIMARY 1,2,3', defaultFees: 5400, porridge: 0, exams: 700 },
  { key: 'UPPER_PRIMARY', label: 'UPPER PRIMARY 4,5,6', defaultFees: 5800, porridge: 0, exams: 700 }
] as const;
const TERMS: api.TermName[] = ['TERM_1', 'TERM_2', 'TERM_3'];
const FIELDS = ['fees', 'lunch', 'porridge', 'exams'] as const;
const ITEM_NAMES = { fees: 'Fees', lunch: 'Lunch', porridge: 'Porridge', exams: 'Exams' } as const;
type GroupKey = typeof GROUPS[number]['key'];
type FieldKey = typeof FIELDS[number];
type Matrix = Record<GroupKey, Record<api.TermName, Record<FieldKey, number>>>;
type Notes = { additional: string[]; boys: string[]; girls: string[]; games: string[] };

const originalNotes: Notes = {
  additional: ['Admission Fee: Kshs. 700 (Payable once on admission)', 'Transport Fee: Kshs. 8,000', 'Maintenance Fee: Kshs. 200 per term', 'Toilet Paper Contribution: Kshs. 100', 'Computer Classes: Kshs. 400 (Grades 1–6 only)', 'Porridge is mandatory for all ECD learners.', 'Learners taking lunch and porridge must come with a plate, spoon, and cup.', 'All learners must report in full school uniform during admission and on all school days.', 'A navy blue jumper branded with the school logo is available for purchase at the school.'],
  boys: ['Trouser: Navy Blue', 'Sweater: Navy Blue', 'Shirt: Small Checked Blue & White', 'Tie: Navy Blue with White Stripes', 'Shoes: Black', 'Socks: Grey with Blue & White Stripes'],
  girls: ['Dress: Small Checked Blue & White', 'Sweater: Navy Blue', 'Shoes: Black'],
  games: ['Navy Blue Tracksuit', 'White T-Shirt', 'Black Shoes']
};

function originalMatrix(): Matrix {
  return Object.fromEntries(GROUPS.map(group => [group.key, Object.fromEntries(TERMS.map(term => [term, { fees: group.defaultFees, lunch: 2500, porridge: group.porridge, exams: group.exams }]))])) as Matrix;
}
const normalize = (value: string) => value.trim().toLowerCase();
const errorText = (error: any) => error?.response?.data?.header?.message || error?.response?.data?.message || error?.message || 'Request failed';

export function FeeTemplateEditor() {
  const [years, setYears] = useState<api.AcademicYear[]>([]);
  const [yearId, setYearId] = useState('');
  const [terms, setTerms] = useState<api.AcademicTerm[]>([]);
  const [structures, setStructures] = useState<api.FeeStructure[]>([]);
  const [matrix, setMatrix] = useState<Matrix>(originalMatrix);
  const [notes, setNotes] = useState<Notes>(originalNotes);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const selectedYear = years.find(year => year.id === yearId);

  useEffect(() => {
    api.getAcademicYears().then(rows => {
      setYears(rows);
      setYearId(rows.find(year => year.active)?.id || rows[0]?.id || '');
    }).catch(error => toast.error(errorText(error))).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!yearId) return;
    setLoading(true);
    Promise.all([api.getTerms(yearId), api.getFeeStructures({ academicYearId: yearId })])
      .then(([termRows, structureRows]) => {
        setTerms(termRows); setStructures(structureRows);
        const next = originalMatrix();
        structureRows.forEach(structure => {
          const term = termRows.find(row => row.id === structure.termId)?.termName;
          if (!term || !GROUPS.some(group => group.key === structure.classGroup)) return;
          structure.items?.forEach(item => {
            const field = FIELDS.find(key => normalize(ITEM_NAMES[key]) === normalize(item.itemName));
            if (field) next[structure.classGroup][term][field] = Number(item.amount);
          });
        });
        setMatrix(next);
        const savedNotes = localStorage.getItem(`ahps_fee_template_notes_${yearId}`);
        setNotes(savedNotes ? JSON.parse(savedNotes) : originalNotes);
      })
      .catch(error => toast.error(errorText(error)))
      .finally(() => setLoading(false));
  }, [yearId]);

  const totals = useMemo(() => Object.fromEntries(GROUPS.map(group => [group.key, Object.fromEntries(TERMS.map(term => [term, FIELDS.reduce((sum, field) => sum + Number(matrix[group.key][term][field] || 0), 0)]))])), [matrix]);

  const updateAmount = (group: GroupKey, term: api.TermName, field: FieldKey, value: number) => {
    setMatrix(previous => ({ ...previous, [group]: { ...previous[group], [term]: { ...previous[group][term], [field]: value } } }));
  };

  const saveTemplate = async (publish: boolean) => {
    if (!yearId) return toast.error('Create or select an academic year first.');
    const missingTerms = TERMS.filter(termName => !terms.some(term => term.termName === termName));
    if (missingTerms.length) return toast.error(`Create ${missingTerms.map(term => term.replace('_', ' ')).join(', ')} before saving this template.`);
    setSaving(true);
    try {
      const known = [...structures];
      for (const group of GROUPS) for (const termName of TERMS) {
        const term = terms.find(row => row.termName === termName)!;
        let structure = known.find(row => row.classGroup === group.key && row.termId === term.id);
        const structureRequest = { academicYearId: yearId, termId: term.id, classGroup: group.key, name: `${group.label} ${termName.replace('_', ' ')} Fee Structure` };
        structure = structure ? await api.updateFeeStructure(structure.id, structureRequest) : await api.createFeeStructure(structureRequest);
        const refreshed = await api.getFeeStructure(structure.id);
        for (const field of FIELDS) {
          const existing = refreshed.items?.find(item => normalize(item.itemName) === normalize(ITEM_NAMES[field]));
          const itemRequest: api.FeeItemRequest = { itemName: ITEM_NAMES[field], amount: matrix[group.key][termName][field], itemType: field === 'fees' || field === 'exams' || (field === 'porridge' && group.key === 'ECD_NURSERY') ? 'COMPULSORY' : 'OPTIONAL', appliesToClassGroup: group.key, description: `${group.label} ${termName.replace('_', ' ')}` };
          existing ? await api.updateFeeItem(structure.id, existing.id, itemRequest) : await api.addFeeItem(structure.id, itemRequest);
        }
        for (const definition of api.STANDARD_FEE_OPTIONS) {
          if (definition.optionName === 'Computer Classes' && group.key === 'ECD_NURSERY') continue;
          const current = refreshed.items?.find(item => normalize(item.itemName) === normalize(definition.optionName));
          const optionRequest: api.FeeItemRequest = { itemName: definition.optionName, amount: definition.defaultAmount, itemType: 'OPTIONAL', appliesToClassGroup: group.key, description: 'Student-selectable fee option' };
          current ? await api.updateFeeItem(structure.id, current.id, optionRequest) : await api.addFeeItem(structure.id, optionRequest);
        }
        if (publish && structure.status !== 'PUBLISHED') structure = await api.publishFeeStructure(structure.id);
        const knownIndex = known.findIndex(row => row.id === structure!.id);
        if (knownIndex >= 0) known.splice(knownIndex, 1, structure);
        else known.push(structure);
      }
      localStorage.setItem(`ahps_fee_template_notes_${yearId}`, JSON.stringify(notes));
      setStructures(await api.getFeeStructures({ academicYearId: yearId }));
      toast.success(publish ? 'Fee template saved and published.' : 'Fee template saved as draft.');
    } catch (error) { toast.error(errorText(error)); }
    finally { setSaving(false); }
  };

  const resetTemplate = () => {
    if (!window.confirm('Reset the visible template to the original 2026 values? Nothing is saved until you press Save.')) return;
    setMatrix(originalMatrix()); setNotes(originalNotes);
  };

  if (loading && !years.length) return <Card className="flex min-h-72 items-center justify-center"><Loader2 className="size-7 animate-spin text-blue-900" /></Card>;
  return <div className="space-y-4">
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Template year</label><select value={yearId} onChange={event => setYearId(event.target.value)} className="h-10 min-w-52 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Select academic year</option>{years.map(year => <option key={year.id} value={year.id}>{year.yearName}{year.active ? ' (Active)' : ''}</option>)}</select></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={resetTemplate} disabled={saving}><RotateCcw className="mr-2 size-4" />Reset original</Button><Button variant="outline" onClick={() => saveTemplate(false)} disabled={saving}><Save className="mr-2 size-4" />Save draft</Button><Button onClick={() => saveTemplate(true)} disabled={saving}>{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}Save & publish</Button></div>
    </Card>
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"><FilePenLine className="mr-2 inline size-4" />Edit amounts and text directly in the familiar fee notice. Totals calculate automatically.</div>
    <div className="overflow-x-auto rounded-xl bg-slate-200 p-2 sm:p-5">
      <article className="mx-auto min-w-[820px] max-w-[980px] bg-white px-12 py-10 shadow-xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        <header className="text-center"><img src={schoolLogo} alt="Agape Hill Primary School" className="mx-auto h-28 w-28 object-contain" /><h2 className="mt-2 text-2xl font-black tracking-wide">AGAPE HILL PRIMARY SCHOOL</h2><p className="text-lg">P.O. BOX 33366-30100. ELDORET. TEL: 0725952826,</p><p className="text-lg underline">Email Address: agapehill2006@gmail.com</p><h1 className="mb-2 mt-12 text-3xl font-black">FEE STRUCTURE {selectedYear?.yearName || 'YEAR'}</h1><div className="h-1 bg-black" /></header>
        <div className="mt-4 space-y-1">{GROUPS.map(group => <section key={group.key}><h3 className="text-2xl font-bold text-[#5687c5]">{group.label}</h3><table className="w-full table-fixed border-collapse text-lg"><thead><tr>{['TERM','FEES','LUNCH','PORRIDGE','EXAMS','TOTALS'].map(label => <th key={label} className="border border-black px-2 py-2 text-left font-normal">{label}</th>)}</tr></thead><tbody>{TERMS.map((term, index) => <tr key={term}><td className="border border-black px-2 py-2">{index + 1}{index === 0 ? 'ST' : index === 1 ? 'ND' : 'RD'} TERM</td>{FIELDS.map(field => <td key={field} className="border border-black p-1"><input aria-label={`${group.label} ${term} ${field}`} type="number" min="0" value={matrix[group.key][term][field]} onChange={event => updateAmount(group.key, term, field, Number(event.target.value))} className="w-full bg-blue-50/40 px-2 py-1 text-center outline-none focus:bg-blue-100" /></td>)}<td className="border border-black px-2 py-2 text-center font-bold">{totals[group.key][term].toLocaleString()}</td></tr>)}</tbody></table></section>)}</div>
        <EditableList title="ADDITIONAL INFORMATION" values={notes.additional} onChange={values => setNotes({ ...notes, additional: values })} />
        <div className="mt-5 grid grid-cols-2 gap-12"><div><EditableList title="BOYS’ UNIFORM" values={notes.boys} onChange={values => setNotes({ ...notes, boys: values })} /></div><div><EditableList title="GIRLS’ UNIFORM" values={notes.girls} onChange={values => setNotes({ ...notes, girls: values })} /><EditableList title="GAMES KIT (ALL LEARNERS)" values={notes.games} onChange={values => setNotes({ ...notes, games: values })} /></div></div>
      </article>
    </div>
    <p className="text-xs text-slate-500">Fee tables are saved to the backend. Additional information and uniform text are currently saved in this browser per academic year because the backend has no template-notes fields yet.</p>
  </div>;
}

function EditableList({ title, values, onChange }: { title: string; values: string[]; onChange: (values: string[]) => void }) {
  const update = (index: number, value: string) => onChange(values.map((item, itemIndex) => itemIndex === index ? value : item));
  return <section className="mt-5"><h3 className="text-2xl font-bold text-[#5687c5]">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-8 text-lg">{values.map((value, index) => <li key={index}><input value={value} onChange={event => update(index, event.target.value)} className="w-full border-b border-transparent bg-blue-50/30 px-1 outline-none focus:border-blue-400 focus:bg-blue-50" /></li>)}</ul><button type="button" onClick={() => onChange([...values, ''])} className="mt-2 text-sm font-bold text-blue-700">+ Add line</button></section>;
}
