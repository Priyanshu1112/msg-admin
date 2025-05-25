import ReactCountryFlag from "react-country-flag";

export default function CountryFlag({ countryCode }: { countryCode: string }) {
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      style={{
        fontSize: "2em",
        lineHeight: "2em",
      }}
      aria-label={countryCode}
    />
  );
}
