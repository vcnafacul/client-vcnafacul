interface Props {
  items: string[];
  changeItem: (index: number) => void;
  className?: string;
  activeTab: number;
}

function HighlightSelector({ items, changeItem, className, activeTab }: Props) {
  function IElements() {
    let cssClass = null;
    return items.map((item, index) => {
      cssClass = activeTab === index ? "chosen " : "normal ";
      return (
        <li
          key={index}
          onClick={() => {
            changeItem(index);
          }}
          className={cssClass}
          tabIndex={index}
        >
          {item}
        </li>
      );
    });
  }

  return (
    <ul className={className}>
      <IElements />
    </ul>
  );
}

export default HighlightSelector;
