export const areSetsEqual = (a, b) => {
    if (a.size !== b.size)
        return false;
    for (const aItem of a) {
        if (!b.has(aItem))
            return false;
    }
    return true;
};
