export type University = {
    name: string;
    domain: string;
    short?: string;
    aliases?: string[]; // Alternative search terms like ["Reading University", "Reading Uni"]
    folder: string; // folder name inside the country-specific root
    country: "United Kingdom" | "Norway";
    root: string; // Root folder for assets (e.g. "Universiteter test" or "Norske universiteter")
    logoSearch: string; // Filename of the favicon/logo in the logo-search folder
    campuses?: string[]; // Optional list of campuses if a school has multiple bases
};

export const UK_UNIVERSITIES: University[] = [
    { name: "Imperial College London", domain: "imperial.ac.uk", short: "Imperial", folder: "Imperial", root: "Universiteter test", country: "United Kingdom", aliases: ["Imperial London"], logoSearch: "imperial_college_london_logo.jpeg" },
    { name: "King's College London", domain: "kcl.ac.uk", short: "KCL", folder: "KCL", root: "Universiteter test", country: "United Kingdom", aliases: ["Kings College", "Kings"], logoSearch: "kings_college_london_logo.jpeg" },
    { name: "London School of Economics", domain: "lse.ac.uk", short: "LSE", folder: "LSE", root: "Universiteter test", country: "United Kingdom", aliases: ["London School of Economics and Political Science"], logoSearch: "london_school_of_economics_logo.jpeg" },
    { name: "University of Manchester", domain: "manchester.ac.uk", short: "Manchester", folder: "Manchester", root: "Universiteter test", country: "United Kingdom", aliases: ["Manchester University"], logoSearch: "sdf.jpg" },
    { name: "University College London", domain: "ucl.ac.uk", short: "UCL", folder: "UCL", root: "Universiteter test", country: "United Kingdom", aliases: ["UCL London"], logoSearch: "university_college_london_logo.jpeg" },
    { name: "University of Reading", domain: "reading.ac.uk", short: "Reading", folder: "University of reading", root: "Universiteter test", country: "United Kingdom", aliases: ["Reading University", "Reading Uni"], logoSearch: "1200x630wa.jpg", campuses: ["University of Reading", "Henley Business School"] },
];

export const NORWAY_UNIVERSITIES: University[] = [
    { name: "NTNU", domain: "ntnu.no", short: "NTNU", folder: "NTNU", root: "Norske universiteter", country: "Norway", aliases: ["Norwegian University of Science and Technology", "Norges teknisk-naturvitenskapelige universitet", "Trondheim"], logoSearch: "ntnu_alt_versjon_uten_slagord.png", campuses: ["Ålesund", "Gjøvik", "Trondheim"] },
    { name: "UiT Norges arktiske universitet", domain: "uit.no", short: "UiT", folder: "UiT", root: "Norske universiteter", country: "Norway", aliases: ["The Arctic University of Norway", "University of Tromsø", "Tromsø", "Alta", "Narvik", "Harstad"], logoSearch: "uit-segl-eng-sort-960px(1) blå copy.png", campuses: ["Alta", "Bardufoss", "Hammerfest"] },
    { name: "Universitetet i Sørøst-Norge", domain: "usn.no", short: "USN", folder: "USN", root: "Norske universiteter", country: "Norway", aliases: ["University of South-Eastern Norway", "USN", "Drammen", "Vestfold", "Kongsberg", "Porsgrunn", "Bø i Telemark"], logoSearch: "logo.png" },
    { name: "Nord universitet", domain: "nord.no", short: "Nord", folder: "Nord", root: "Norske universiteter", country: "Norway", aliases: ["Bodø", "Levanger", "Steinkjer"], logoSearch: "logo.png" },
    { name: "OsloMet", domain: "oslomet.no", short: "OsloMet", folder: "OsloMet", root: "Norske universiteter", country: "Norway", aliases: ["Oslo Metropolitan University", "Storbyuniversitetet", "Pilestredet", "Kjeller", "Sandvika"], logoSearch: "65b294d8e6618.png", campuses: ["Kjeller", "Oslo and Pilestredet", "Sandvika"] },
    { name: "Universitetet i Innlandet", domain: "inn.no", short: "HINN", folder: "HINN", root: "Norske universiteter", country: "Norway", aliases: ["Inland Norway University of Applied Sciences", "Lillehammer", "Hamar", "Elverum", "Rena"], logoSearch: "logo.png" },
    { name: "BI - Handelshøyskolen", domain: "bi.no", short: "BI", folder: "BI", root: "Norske universiteter", country: "Norway", aliases: ["BI Norwegian Business School", "BI Business School", "Handelshøyskolen BI", "Handelshoyskolen BI", "Oslo", "Bergen", "Trondheim", "Stavanger"], logoSearch: "BI_Norwegian_Business_School_logo.svg(1).png", campuses: ["Oslo", "Bergen", "Trondheim", "Stavanger"] },
    { name: "Universitetet i Oslo", domain: "uio.no", short: "UiO", folder: "UiO", root: "Norske universiteter", country: "Norway", aliases: ["University of Oslo", "Oslo", "Blindern"], logoSearch: "logo.png", campuses: ["Blindern", "Oslo"] },
    { name: "Universitetet i Bergen", domain: "uib.no", short: "UiB", folder: "UiB", root: "Norske universiteter", country: "Norway", aliases: ["University of Bergen", "Bergen"], logoSearch: "logo.png", campuses: ["Bergen"] },
    { name: "Universitetet i Stavanger", domain: "uis.no", short: "UiS", folder: "UiS", root: "Norske universiteter", country: "Norway", aliases: ["University of Stavanger", "Stavanger"], logoSearch: "logo.png", campuses: ["Stavanger"] },
    { name: "Universitetet i Agder", domain: "uia.no", short: "UiA", folder: "UiA", root: "Norske universiteter", country: "Norway", aliases: ["University of Agder", "Kristiansand", "Grimstad"], logoSearch: "logo.png", campuses: ["Grimstad", "Kristiansand"] },
    { name: "Norges miljø- og biovitenskapelige universitet", domain: "nmbu.no", short: "NMBU", folder: "NMBU", root: "Norske universiteter", country: "Norway", aliases: ["Norwegian University of Life Sciences", "Ås"], logoSearch: "logo.png", campuses: ["Ås"] },
];

export const ALL_UNIVERSITIES = [...UK_UNIVERSITIES, ...NORWAY_UNIVERSITIES];

export function searchUniversities(query: string, country?: string, limit = 6): University[] {
    try {
        const trimmed = query?.trim()?.toLowerCase() || "";
        if (!trimmed) return [];
        
        // Handle country detection
        let currentCountry = country;
        if (!country && typeof window !== "undefined") {
            try {
                const savedData = localStorage.getItem("lnbg_user_data");
                if (savedData && typeof savedData === "string") {
                    const parsed = JSON.parse(savedData);
                    if (parsed && typeof parsed === "object" && parsed.country) {
                        currentCountry = parsed.country;
                    }
                }
            } catch (e) {
                // Silently fail - continue with default
                console.debug("Failed to parse user data from localStorage");
            }
        }
        // Final fallback for sorting priority
        const priorityCountry = currentCountry || "United Kingdom";

        const queryWords = trimmed.split(/\s+/).filter(Boolean);
        
        if (queryWords.length === 0) return [];
        
        // If a specific supported country is selected (Norway or UK), strictly filter by it
        const restrictCountry = currentCountry === "Norway" || currentCountry === "United Kingdom";

        // Search across ALL universities (or filtered by country)
        const results = ALL_UNIVERSITIES.filter(u => {
            if (restrictCountry && u.country !== currentCountry) {
                return false;
            }

            try {
                const searchableText = [
                    u?.name || "",
                    u?.short || "",
                    u?.domain || "",
                    u?.country || "",
                    u?.root || "",
                    ...(u?.aliases || [])
                ].join(" ").toLowerCase();
                
                return queryWords.every(word => searchableText.includes(word));
            } catch (e) {
                console.debug("Error filtering university:", e);
                return false;
            }
        });

        // Sort logic:
        // 1. Exact match on short name (abbreviation)
        // 2. Exact match on full name
        // 3. Country priority
        // 4. Alphabetical
        return results.sort((a, b) => {
            try {
                const aShortLower = a?.short?.toLowerCase() || "";
                const bShortLower = b?.short?.toLowerCase() || "";
                const aNameLower = a?.name?.toLowerCase() || "";
                const bNameLower = b?.name?.toLowerCase() || "";

                // Exact short match
                const aExactShort = aShortLower === trimmed;
                const bExactShort = bShortLower === trimmed;
                if (aExactShort && !bExactShort) return -1;
                if (!aExactShort && bExactShort) return 1;

                // Exact name match
                const aExactName = aNameLower === trimmed;
                const bExactName = bNameLower === trimmed;
                if (aExactName && !bExactName) return -1;
                if (!aExactName && bExactName) return 1;

                // Priority country
                if (a?.country === priorityCountry && b?.country !== priorityCountry) return -1;
                if (a?.country !== priorityCountry && b?.country === priorityCountry) return 1;

                return aNameLower.localeCompare(bNameLower);
            } catch (e) {
                console.debug("Error sorting universities:", e);
                return 0;
            }
        }).slice(0, limit);
    } catch (e) {
        console.error("searchUniversities error:", e);
        return [];
    }
}
