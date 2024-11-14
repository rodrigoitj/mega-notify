function dayOfWeekAsString(dayIndex: number) {
  return (
    ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'][dayIndex - 1] ||
    ''
  );
}
export { dayOfWeekAsString };
