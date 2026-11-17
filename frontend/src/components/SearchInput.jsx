// Labelled text box for searching a list; styled like FilterSelect.
function SearchInput({ id, label = "Search", value, onChange, placeholder = "Title, category, note..." }) {
    return (
        <div className="filter-select filter-search">
            <label htmlFor={id}>{label}</label>

            <input
                id={id}
                type="search"
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

export default SearchInput;
