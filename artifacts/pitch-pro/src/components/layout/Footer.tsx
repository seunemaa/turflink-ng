export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xl font-bold">
            <span className="text-primary">TurfLink</span> <span className="text-foreground">NG</span>
          </span>
          <span className="text-sm text-muted-foreground mt-1">Premium Nigerian Football Facilities</span>
        </div>
        
        <div className="text-sm text-muted-foreground text-center md:text-right">
          <p>Built by <a href="mailto:seun.emaa@gmail.com" className="text-primary font-medium hover:underline">seun.emaa</a> &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
