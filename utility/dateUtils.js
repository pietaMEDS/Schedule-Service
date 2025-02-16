const getNextMonday = (date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 6) {
        date.setDate(date.getDate() + 2);
    } else if (dayOfWeek === 0) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

module.exports = { getNextMonday };
