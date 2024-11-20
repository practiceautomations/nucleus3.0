export default function classNames(
  ...classes: (string | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
