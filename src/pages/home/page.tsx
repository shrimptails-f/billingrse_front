import { useNavigate } from 'react-router-dom';
import { PageIntroCard } from '@/components/ui/PageIntroCard';
import { Button } from '@/components/ui/primitives/Button';
import { BillingSummaryMock } from './BillingSummaryMock';

const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="page-shell">
      <PageIntroCard
        className="mx-auto max-w-3xl"
        eyebrow="Dashboard"
        title="ログイン後ホーム"
        description="ログイン後に表示する画面だけを残した構成です。追加機能を戻す場合は、この画面を起点に再構成できます。"
      >
        <Button type="button" fullWidth={false} onClick={() => navigate('/manual-mail-workflows')}>
          手動メール取得を開く
        </Button>
      </PageIntroCard>

      <BillingSummaryMock />
    </section>
  );
};

export default HomePage;
