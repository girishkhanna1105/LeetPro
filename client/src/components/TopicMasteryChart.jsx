import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const TopicMasteryChart = ({ data }) => {
    // Show top 15 topics with the most solves
    const sortedData = [...(data || [])]
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .slice(0, 15);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis type="number" stroke="#888888" dataKey="problemsSolved" />
                <YAxis
                    dataKey="tagName"
                    type="category"
                    width={100}
                    tick={{ fill: '#888888', fontSize: 12 }}
                    stroke="#888888"
                    interval={0}
                />
                <Tooltip
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                    contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                    }}
                />
                <Bar dataKey="problemsSolved" fill="hsl(var(--primary))" barSize={20}>
                    <LabelList dataKey="problemsSolved" position="right" fill="#ffffff" fontSize={12} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopicMasteryChart;