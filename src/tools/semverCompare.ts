export function semverCompare(v1: string, v2: string): '>' | '<' | '=' {
  const n1 = v1.split('.').map(Number);
  const n2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (n1[i] === n2[i]) {
      continue;
    } else if (n1[i] > n2[i]) {
      return '>';
    } else {
      return '<';
    }
  }

  return '=';
}
