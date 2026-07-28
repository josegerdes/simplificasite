export function LocationMap({ name, address }: { name: string; address: string }) {
  const query = encodeURIComponent(address);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <iframe
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        className="h-48 w-full grayscale-[20%]"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Mapa — ${name}`}
      />
    </div>
  );
}
