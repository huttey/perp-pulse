
'use client';
export default function ScoreBadge({ score, direction }:{score:number; direction:string}){
  const color = score >= 4 ? 'bg-green-600' : score <=2 ? 'bg-red-600' : 'bg-gray-600';
  return <span className={`px-3 py-1 rounded-full text-white text-sm ${color}`}>{direction} · {score}/5</span>;
}
