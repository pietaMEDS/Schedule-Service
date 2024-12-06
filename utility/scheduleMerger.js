const mergeSchedules = (lessons, replacements) => {
    let mergedSchedules = [...lessons];

    replacements.forEach(replacement => {
        replacement.dayOfWeek = replacement.datOfWeek;

        const existingLesson = mergedSchedules.find(lesson =>
            lesson.ordinal === replacement.ordinal &&
            lesson.dayOfWeek === replacement.dayOfWeek
        );

        if (existingLesson) {
            Object.assign(existingLesson, replacement);
        } else {
            mergedSchedules.push({
                ...replacement,
                id: mergedSchedules.length + 1
            });
        }
    });

    return mergedSchedules;
};

module.exports = mergeSchedules;
