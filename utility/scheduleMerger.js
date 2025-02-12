const mergeSchedules = (lessons, replacements) => {
    let mergedSchedules = [...lessons];
    console.log(mergedSchedules);

    replacements.forEach(replacement => {
        replacement.dayOfWeek = replacement.datOfWeek;
        replacement.isReplacement = true;

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

    mergedSchedules.sort((a, b) => a.ordinal - b.ordinal);

    return mergedSchedules;
};

module.exports = mergeSchedules;
