export const Container = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className=" space-y-6 p-6 max-w-7xl mx-auto">{children}</div>;
};
