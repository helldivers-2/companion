import React from "react";
import getSvgs from "@/lib/getSVGs";

const svgData = getSvgs();

const MyComponent: React.FC = () => {
  return (
    <div>
      {Object.entries(svgData).map(([categoryPath, { folderName, files }]) => (
        <div key={categoryPath}>
          <h2 className="mb-4 text-2xl font-bold">{folderName}</h2>
          <div className="grid grid-cols-8 gap-4">
            {files.map(({ name, path }) => {
              const SVGComponent = React.lazy(() => import(`/public/${path}`));
              return (
                <div key={path} className="rounded border p-4 hover:bg-muted">
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <SVGComponent className="h-auto w-full" />
                  </React.Suspense>
                  <p className="mt-2 text-center">{name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyComponent;
