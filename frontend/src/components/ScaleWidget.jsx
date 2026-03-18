export function ScaleWidget({ scaleKey, value, onChange }) {
  return (
    <div className="scale-buttons">
      {[1, 2, 3, 4].map(n => (
        <button
          key={n}
          className={`sbt${value === n ? ` a${n}` : ''}`}
          onClick={() => onChange(scaleKey, n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function ScaleLegend({ labels }) {
  const defaults = ['לא מתקיים', 'חלקי', 'מספק', 'מצוין'];
  const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#27ae60'];
  const texts = labels || defaults;
  return (
    <div className="sleg">
      {texts.map((t, i) => (
        <div key={i} className="sli">
          <div className="slid" style={{ background: colors[i] }} />
          {i + 1} = {t}
        </div>
      ))}
    </div>
  );
}
