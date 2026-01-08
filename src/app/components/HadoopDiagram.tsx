import { useState } from 'react';
import { Server, Database, Network, Workflow } from 'lucide-react';
import { Card } from './ui/card';

interface ComponentInfo {
  title: string;
  description: string;
  type: 'master' | 'slave' | 'client';
}

const componentDetails: Record<string, ComponentInfo> = {
  client: {
    title: 'Client',
    description: 'User application that submits jobs to the Hadoop cluster',
    type: 'client'
  },
  namenode: {
    title: 'NameNode',
    description: 'The heart of the Hadoop system; manages the file system namespace and stores the metadata information of the data blocks.',
    type: 'master'
  },
  jobtracker: {
    title: 'JobTracker',
    description: 'An interface between the user and the framework; manages the execution of MapReduce jobs and assigns tasks to the TaskTrackers.',
    type: 'master'
  },
  datanode: {
    title: 'DataNode',
    description: 'Stores the actual data blocks, as instructed by the NameNode.',
    type: 'slave'
  },
  tasktracker: {
    title: 'TaskTracker',
    description: 'Monitors the execution of MapReduce jobs on the individual DataNodes.',
    type: 'slave'
  }
};

export function HadoopDiagram() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const MasterNode = ({ id, title, icon: Icon, x, y }: { id: string; title: string; icon: any; x: number; y: number }) => (
    <g
      onMouseEnter={() => setActiveComponent(id)}
      onMouseLeave={() => setActiveComponent(null)}
      className="cursor-pointer"
    >
      <rect
        x={x}
        y={y}
        width="160"
        height="80"
        rx="8"
        className={`transition-all ${
          activeComponent === id
            ? 'fill-blue-600 stroke-blue-700'
            : 'fill-blue-500 stroke-blue-600'
        }`}
        strokeWidth="2"
      />
      <foreignObject x={x} y={y} width="160" height="80">
        <div className="flex flex-col items-center justify-center h-full text-white">
          <Icon className="size-6 mb-2" />
          <span className="font-semibold">{title}</span>
        </div>
      </foreignObject>
    </g>
  );

  const SlaveNode = ({ id, x, y, number }: { id: string; x: number; y: number; number: number }) => (
    <g
      onMouseEnter={() => setActiveComponent(`${id}-${number}`)}
      onMouseLeave={() => setActiveComponent(null)}
      className="cursor-pointer"
    >
      <rect
        x={x}
        y={y}
        width="140"
        height="100"
        rx="8"
        className={`transition-all ${
          activeComponent === `${id}-${number}`
            ? 'fill-emerald-600 stroke-emerald-700'
            : 'fill-emerald-500 stroke-emerald-600'
        }`}
        strokeWidth="2"
      />
      <foreignObject x={x} y={y} width="140" height="100">
        <div className="flex flex-col items-center justify-center h-full text-white p-2">
          <Database className="size-5 mb-1" />
          <span className="font-semibold text-sm">DataNode {number}</span>
          <div className="h-px w-12 bg-white/30 my-1" />
          <Workflow className="size-5 mb-1" />
          <span className="font-semibold text-sm">TaskTracker {number}</span>
        </div>
      </foreignObject>
    </g>
  );

  const Arrow = ({ x1, y1, x2, y2, dashed = false }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) => (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="stroke-gray-400"
        strokeWidth="2"
        strokeDasharray={dashed ? "5,5" : "0"}
        markerEnd="url(#arrowhead)"
      />
    </>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2">Hadoop Cluster Architecture</h1>
        <p className="text-gray-600">Interactive diagram showing the components and their relationships</p>
      </div>

      <div className="mb-8">
        <svg viewBox="0 0 800 600" className="w-full h-auto border border-gray-200 rounded-lg bg-gray-50">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
            </marker>
          </defs>

          {/* Client */}
          <g
            onMouseEnter={() => setActiveComponent('client')}
            onMouseLeave={() => setActiveComponent(null)}
            className="cursor-pointer"
          >
            <rect
              x="320"
              y="20"
              width="160"
              height="60"
              rx="8"
              className={`transition-all ${
                activeComponent === 'client'
                  ? 'fill-purple-600 stroke-purple-700'
                  : 'fill-purple-500 stroke-purple-600'
              }`}
              strokeWidth="2"
            />
            <foreignObject x="320" y="20" width="160" height="60">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Network className="size-6 mb-1" />
                <span className="font-semibold">Client</span>
              </div>
            </foreignObject>
          </g>

          {/* Master Nodes */}
          <MasterNode id="namenode" title="NameNode" icon={Server} x={80} y={150} />
          <MasterNode id="jobtracker" title="JobTracker" icon={Workflow} x={560} y={150} />

          {/* Slave Nodes */}
          <SlaveNode id="slave" x={50} y={320} number={1} />
          <SlaveNode id="slave" x={230} y={320} number={2} />
          <SlaveNode id="slave" x={410} y={320} number={3} />
          <SlaveNode id="slave" x={590} y={320} number={4} />

          {/* Arrows from Client */}
          <Arrow x1={360} y1={80} x2={160} y2={145} />
          <Arrow x1={440} y1={80} x2={640} y2={145} />

          {/* Arrows from NameNode to DataNodes */}
          <Arrow x1={120} y1={230} x2={100} y2={315} dashed />
          <Arrow x1={140} y1={230} x2={280} y2={315} dashed />
          <Arrow x1={160} y1={230} x2={460} y2={315} dashed />
          <Arrow x1={180} y1={230} x2={640} y2={315} dashed />

          {/* Arrows from JobTracker to TaskTrackers */}
          <Arrow x1={620} y1={230} x2={140} y2={315} />
          <Arrow x1={640} y1={230} x2={320} y2={315} />
          <Arrow x1={660} y1={230} x2={500} y2={315} />
          <Arrow x1={680} y1={230} x2={680} y2={315} />

          {/* Labels */}
          <text x="400" y="115" textAnchor="middle" className="fill-gray-600 text-xs">
            Submit Jobs
          </text>
          <text x="400" y="280" textAnchor="middle" className="fill-gray-600 text-xs font-semibold">
            Master Nodes (Cluster)
          </text>
          <text x="400" y="475" textAnchor="middle" className="fill-gray-600 text-xs font-semibold">
            Slave Nodes (Worker Nodes)
          </text>
        </svg>
      </div>

      {/* Information Panel */}
      <Card className="p-6">
        <h2 className="mb-4">Component Details</h2>
        {activeComponent ? (
          <div>
            <h3 className="mb-2">{componentDetails[activeComponent.split('-')[0]]?.title || 'Slave Node'}</h3>
            <p className="text-gray-600">
              {componentDetails[activeComponent.split('-')[0]]?.description || 
                'Each slave node contains a DataNode (stores actual data blocks) and a TaskTracker (monitors MapReduce job execution).'}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">Hover over any component in the diagram to see its details</p>
        )}
      </Card>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Network className="size-6 text-white" />
            </div>
            <div>
              <h3 className="mb-1">Client Layer</h3>
              <p className="text-sm text-gray-600">Submits jobs to cluster</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Server className="size-6 text-white" />
            </div>
            <div>
              <h3 className="mb-1">Master Nodes</h3>
              <p className="text-sm text-gray-600">Manage metadata & jobs</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Database className="size-6 text-white" />
            </div>
            <div>
              <h3 className="mb-1">Slave Nodes</h3>
              <p className="text-sm text-gray-600">Store data & execute tasks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Component Table */}
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Component</th>
                <th className="px-6 py-3 text-left text-gray-700">Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">NameNode</td>
                <td className="px-6 py-4 text-gray-600">
                  The heart of the Hadoop system; manages the file system namespace and stores the metadata information of the data blocks.
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">DataNode</td>
                <td className="px-6 py-4 text-gray-600">
                  Stores the actual data blocks, as instructed by the NameNode.
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">JobTracker</td>
                <td className="px-6 py-4 text-gray-600">
                  An interface between the user and the framework; manages the execution of MapReduce jobs and assigns tasks to the TaskTrackers.
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">TaskTracker</td>
                <td className="px-6 py-4 text-gray-600">
                  Monitors the execution of MapReduce jobs on the individual DataNodes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
