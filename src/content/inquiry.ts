export function validatePublicInquiry(input: unknown) {
  const body = input as Record<string, unknown>;
  const invalid = () => { throw Object.assign(new Error('Bitte Name, gültige E-Mail und Nachricht angeben. Eingaben oder Auswahl sind ungültig.'), { statusCode: 400 }); };
  if (!body || typeof body !== 'object' || Array.isArray(body)) return invalid();
  const field = (key: string, max: number, required = false) => {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) return invalid();
    return value.trim();
  };
  const name = field('name', 160, true);
  const email = field('email', 254, true);
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) || /[,;"\\]/.test(email) || /[\r\n<>]/.test(name)) return invalid();
  const interests = body.interests ?? [];
  const selectedPackages = body.selectedPackages ?? [];
  if (!Array.isArray(interests) || interests.length > 12 || interests.some(value => typeof value !== 'string' || value.length > 200)) return invalid();
  if (!Array.isArray(selectedPackages) || selectedPackages.length > 20 || selectedPackages.some(value => !value || typeof value.name !== 'string' || value.name.length > 200 || typeof value.price !== 'string' || value.price.length > 80)) return invalid();
  return { name, email, phone: field('phone', 80), foundVia: field('foundVia', 200), date: field('date', 120), locationAddress: field('locationAddress', 300), message: field('message', 6000, true), interests: interests as string[], selectedPackages: selectedPackages.map(value => ({ name: value.name, price: value.price })), selectedAddons: [] as string[], estimatedTotal: '', weddingGuide: body.weddingGuide === true, meetingDate: field('meetingDate', 100), meetingType: field('meetingType', 50), website: field('website', 300) };
}
