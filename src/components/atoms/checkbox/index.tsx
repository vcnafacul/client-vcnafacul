export interface CheckboxProps {
  name: string;
  title: string;
}

export function Checkbox({ name, title }: CheckboxProps) {
  return (
    <li>
      <input type="checkbox" className="mr-2" name={name} id={name} />
      <label htmlFor={name}>{title}</label>
    </li>
  );
}
