const mergeSchedules = (lessons, replacements) => {
    let mergedSchedules = [...lessons];

    replacements.forEach(replacement => {
        const existingLesson = mergedSchedules.find(lesson => lesson.ordinal === replacement.ordinal && lesson.datOfWeek === replacement.datOfWeek);

        if (existingLesson) {
            Object.assign(existingLesson, {
                ...replacement,
                id: existingLesson.id

            });
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
