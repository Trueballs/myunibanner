export type University = {
    name: string;
    domain: string;
    short?: string;
    folder: string; // folder name inside "Universiteter test/"
};

export const UK_UNIVERSITIES: University[] = [
    { name: "Imperial College London", domain: "imperial.ac.uk", short: "Imperial", folder: "Imperial" },
    { name: "King's College London", domain: "kcl.ac.uk", short: "KCL", folder: "KCL" },
    { name: "London School of Economics", domain: "lse.ac.uk", short: "LSE", folder: "LSE" },
    { name: "University of Manchester", domain: "manchester.ac.uk", short: "Manchester", folder: "Manchester" },
    { name: "University College London", domain: "ucl.ac.uk", short: "UCL", folder: "UCL" },
];

export function searchUniversities(query: string, limit = 6): University[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return UK_UNIVERSITIES.filter(
        (u) =>
            u.name.toLowerCase().includes(q) ||
            u.short?.toLowerCase().includes(q) ||
            u.domain.toLowerCase().includes(q)
    ).slice(0, limit);
}
