
'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonitorChart({ data }:{ data: { t:number; close:number; k:number; d:number; hist:number }[] }){
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="t" tickFormatter={(v)=>new Date(v).toLocaleTimeString()} hide/>
          <YAxis yAxisId="price" />
          <YAxis yAxisId="osc" orientation="right" />
          <Tooltip/>
          <Legend/>
          <Line yAxisId="price" type="monotone" dataKey="close" dot={false} name="Close" />
          <Line yAxisId="osc" type="monotone" dataKey="k" dot={false} name="StochRSI %K" />
          <Line yAxisId="osc" type="monotone" dataKey="d" dot={false} name="StochRSI %D" />
          <Line yAxisId="osc" type="monotone" dataKey="hist" dot={false} name="MACD Hist" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
