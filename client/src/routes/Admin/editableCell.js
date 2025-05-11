function EditableCell({ Value, isEditing, onChange}) {
    return (
        isEditing ? (
            <input
                type="text"
                value={Value}
                onChange={(e) => onChange(e.target.value)}
            />
        ) : (
            Value
        )
    )
}

export default EditableCell;