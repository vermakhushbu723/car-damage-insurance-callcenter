/** Free-text match across every visible field of a communication row. */
export const matchesSearch = (row, term) => {
    if (!term) return true;

    const haystack = [
        row.type,
        row.tag,
        row.reference,
        row.description,
        row.subDescription,
        row.person,
        row.personMeta,
        row.channel,
        row.status,
        row.dateTime?.date,
        row.dateTime?.time,
        ...(row.bullets || []),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(term.toLowerCase());
};

export default matchesSearch;
