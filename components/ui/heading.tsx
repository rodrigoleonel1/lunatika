interface HeadingProps {
  title: string;
  description?: string;
  separator?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  separator,
}) => {
  return (
    <header className={separator ? "border-b pb-4" : ""}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  );
};
