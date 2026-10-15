// A labelled dropdown used for filtering / sorting lists.
// options: [{ value, label }]
function FilterSelect({ id, label, value, onChange, options }) {
    return (
        <div className="filter-select">
            <label htmlFor={id}>{label}</label>

            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default FilterSelect;
