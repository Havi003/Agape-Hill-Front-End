import { useState, useEffect } from 'react';
import { 
  Calendar, Plus, ArrowLeft, Search, Users, 
  CheckCircle2, AlertCircle, Clock, Coins, DollarSign, UserCheck
} from 'lucide-react';
import { Button } from '../ui/button';
import { getStudents, Student } from '../../../services/StudentsApi';
import { 
  getAllEvents, createSchoolEvent, getEventLedger, logEventPayment, 
  SchoolEvent, EventParticipant 
} from '../../../services/EventsApi';

export function EventsManager() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [view, setView] = useState<'list' | 'ledger' | 'create'>('list');
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Main Event Creation Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newFee, setNewFee] = useState('');

  // Payment Transaction States
  const [isLoggingPayment, setIsLoggingPayment] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Synchronize master directories from backend database
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [eventsList, studentsList] = await Promise.all([
        getAllEvents(),
        getStudents()
      ]);
      setEvents(eventsList);
      setStudents(studentsList);
    } catch (err) {
      console.error("Failed loading data directories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [view]);

  const handleOpenLedger = async (event: SchoolEvent) => {
    try {
      const ledgerRoster = await getEventLedger(event.id);
      setSelectedEvent({ ...event, participants: ledgerRoster });
      setView('ledger');
    } catch (err) {
      console.error("Error retrieving ledger records:", err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newFee) return;

    try {
      await createSchoolEvent({
        title: newTitle,
        eventDate: newDate,
        eventTime: newTime || '08:00 AM',
        registrationFee: parseFloat(newFee)
      });
      setView('list');
      setNewTitle('');
      setNewDate('');
      setNewTime('');
      setNewFee('');
    } catch (err) {
      console.error("Failed saving event structure:", err);
    }
  };

  const handleLogTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedStudentId || !paymentAmount) return;

    try {
      await logEventPayment(selectedEvent.id, selectedStudentId, parseFloat(paymentAmount));
      
      // Instantly refresh tracking context indices directly from PostgreSQL
      const ledgerRoster = await getEventLedger(selectedEvent.id);
      setSelectedEvent({ ...selectedEvent, participants: ledgerRoster });
      
      setIsLoggingPayment(false);
      setSelectedStudentId('');
      setPaymentAmount('');
    } catch (err) {
      console.error("Transaction logging failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* VIEW 1: EVENTS LIST */}
      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="size-7 text-blue-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">School Events & Activities</h1>
                <p className="text-gray-500 text-sm">Create activities, map dates, and manage event financial entries.</p>
              </div>
            </div>
            <Button 
              onClick={() => setView('create')}
              className="bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-2"
            >
              <Plus className="size-4" /> Log New Event
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Syncing database registers...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6">
                    <div className="bg-blue-50 text-blue-900 font-bold px-3 py-1 rounded text-xs inline-block mb-3">
                      Ksh. {Number(event.registrationFee || 0).toLocaleString()} / Student
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600 my-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <span>{event.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-gray-400" />
                        <span>{event.eventTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1"><Users className="size-4" /> {event.participantCount || 0}</span>
                      <span className="flex items-center gap-1 text-green-700 font-semibold">Ksh. {Number(event.totalCollected || 0).toLocaleString()}</span>
                    </div>
                    <button onClick={() => handleOpenLedger(event)} className="text-blue-900 hover:text-blue-700 font-semibold">
                      Manage Roster →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FINANCIAL ROSTER LEDGER */}
      {view === 'ledger' && selectedEvent && (
        <div className="space-y-6">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="size-4" /> Back to all events
          </button>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <p className="text-gray-500 mt-1">Event Cost: Ksh. {Number(selectedEvent.registrationFee || 0).toLocaleString()} per participant</p>
            </div>
            <Button 
              onClick={() => setIsLoggingPayment(!isLoggingPayment)}
              className="bg-green-700 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <DollarSign className="size-4" /> Record Student Payment
            </Button>
          </div>

          {/* Inline Payment Entry Section Using Active Live Students List */}
          {isLoggingPayment && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 max-w-xl">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <UserCheck className="size-5 text-blue-900" /> Log Transaction Statement
              </h3>
              <form onSubmit={handleLogTransaction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Select Active Student</label>
                    <select 
                      required
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Roster File --</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.fullName} ({student.admissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Amount Deposited (Ksh.)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 300"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsLoggingPayment(false)} className="text-xs font-semibold px-3 py-1.5 hover:bg-gray-200 rounded text-gray-600">Dismiss</button>
                  <button type="submit" className="text-xs font-semibold px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded shadow-sm">Confirm Transaction</button>
                </div>
              </form>
            </div>
          )}

          {/* Ledger Table Panel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-bold text-gray-900 text-lg">Payments Ledger</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search ledger sheet..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left">Admission No.</th>
                    <th className="px-6 py-4 text-left">Student Name</th>
                    <th className="px-6 py-4 text-right">Total Transacted</th>
                    <th className="px-6 py-4 text-center">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {(selectedEvent.participants || [])
                    .filter(p => p.fullName.toLowerCase().includes(rosterSearch.toLowerCase()))
                    .map((participant) => {
                      const isFullyPaid = participant.amountPaid >= selectedEvent.registrationFee;
                      const isNotPaid = participant.amountPaid === 0;

                      return (
                        <tr key={participant.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono font-medium text-gray-900">{participant.admissionNumber}</td>
                          <td className="px-6 py-4 text-gray-700 font-medium">{participant.fullName}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            Ksh. {Number(participant.amountPaid).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isFullyPaid ? (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                                <CheckCircle2 className="size-3" /> Fully Paid
                              </span>
                            ) : isNotPaid ? (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">
                                <AlertCircle className="size-3" /> Not Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200">
                                <Coins className="size-3" /> Partial (Ksh. {(selectedEvent.registrationFee - participant.amountPaid).toLocaleString()} Bal)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CREATE EVENT FORM */}
      {view === 'create' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Log an Upcoming School Event</h2>
            <p className="text-sm text-gray-500 mt-1">Configure parameters to generate an activity panel module.</p>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Event Title Name</label>
              <input type="text" mountaineer="" required placeholder="e.g., Swimming Gala, Graduation Ceremony" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Time</label>
                <input type="text" placeholder="e.g., 10:00 AM" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Registration Fee Requirement (Ksh.)</label>
              <input type="number" required placeholder="0.00" value={newFee} onChange={(e) => setNewFee(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button type="submit" className="bg-blue-900 text-white">Save Event Structure</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}