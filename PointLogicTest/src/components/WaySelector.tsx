interface Props {
  selectedWay: "me" | number;
  setSelectedWay: (way: "me" | number) => void;
}

const WaySelector: React.FC<Props> = ({ selectedWay, setSelectedWay }) => {
  return (
    <div>
      <button onClick={() => setSelectedWay("me")}>내 좌표</button>
      {[1, 2, 3, 4, 5].map(id => (
        <button key={id} onClick={() => setSelectedWay(id)}>
          way {id}
        </button>
      ))}
    </div>
  );
};

export default WaySelector;
