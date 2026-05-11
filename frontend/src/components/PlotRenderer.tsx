import dynamic from 'next/dynamic';

// Plotly needs to be dynamically imported without SSR
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type PlotFigure = {
  data: unknown[];
  layout?: Record<string, unknown>;
};

export default function PlotRenderer({ figure }: { figure: PlotFigure | null }) {
  if (!figure) return null;
  return (
    <div className="w-full flex justify-center pb-4">
      <Plot
        data={figure.data}
        layout={{
          ...figure.layout,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#e2e8f0' },
          autosize: true,
        }}
        useResizeHandler={true}
        style={{ width: "100%", minHeight: "400px" }}
      />
    </div>
  );
}
