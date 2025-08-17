const axios = require("axios");
const { cmd } = require("../command");

// Helper function to convert a country ISO code to its flag emoji
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .split("")
    .map(letter => String.fromCodePoint(letter.charCodeAt(0) + 127397))
    .join("");
}

cmd({
    pattern: "check",
    alias: ["countrycode"],
    desc: "Checks the country calling code and returns the corresponding country name(s) with flag",
    category: "utility",
    use: '.check <code>',
    example: '.check 1',
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        let code = args[0];
        if (!code) {
            return reply("❌ Please provide a country code. Example: `.check 254`");
        }

        // Remove any non-digit characters
        code = code.replace(/\D/g, '');

        if (!code) {
            return reply("❌ Please provide a valid numeric country code.");
        }

        // Using RestCountries v3.1 API with name,cca2,idd fields only
        const url = `https://restcountries.com/v3.1/independent?status=true&fields=name,cca2,idd`;
        const { data } = await axios.get(url);

        // Find countries where the calling code matches
        const matchingCountries = data.filter(country => {
            if (!country.idd?.root) return false;
            
            // Some countries have multiple calling codes (like +1-xxx for US/CA)
            const prefixes = country.idd.suffixes 
                ? country.idd.suffixes.map(suffix => country.idd.root + suffix)
                : [country.idd.root];
                
            return prefixes.some(prefix => prefix.includes(code));
        });

        if (matchingCountries.length > 0) {
            const countryList = matchingCountries
                .map(country => {
                    const flag = getFlagEmoji(country.cca2);
                    const name = country.name.common;
                    const root = country.idd.root;
                    const suffixes = country.idd.suffixes?.join(', ') || '';
                    return `${flag} ${name} (${root}${suffixes})`;
                })
                .join("\n");
                
            reply(`✅ *Country Code*: +${code}\n🌍 *Matching Countries*:\n${countryList}`);
        } else {
            reply(`❌ No country found for the code +${code}. Try searching for the root code (e.g., "1" instead of "1204").`);
        }
    } catch (error) {
        console.error("Country code check error:", error);
        reply("❌ Failed to check country code. The service might be temporarily unavailable.");
    }
});
