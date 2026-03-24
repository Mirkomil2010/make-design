import { DesignSystemDetail } from "@/components/design-system-detail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DesignSystemPage({ params }: PageProps) {
  const { slug } = await params;
  return <DesignSystemDetail slug={slug} />;
}
