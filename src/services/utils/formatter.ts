export function formatToSlug(name: String) {
    return name.trim().replace(/\s+/g, "-");
}
