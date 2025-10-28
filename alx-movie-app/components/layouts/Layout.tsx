type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <main>{children ?? 'Layout'}</main>
  )
}