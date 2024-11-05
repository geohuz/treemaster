const RecursiveComponent = ({ data }) => {
  return (
    <div style={{ paddingLeft: "20px" }}>
      {data.map((parent) => {
        return (
          <div key={parent.name}>
            {/* rendering folders */}
            {parent.isFolder && <button>{parent.name}</button>}
            {/* rendering files */}
            {!parent.isFolder && <span>{parent.name}</span>}
            <div>
              {parent.children && <RecursiveComponent data={parent.children} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
