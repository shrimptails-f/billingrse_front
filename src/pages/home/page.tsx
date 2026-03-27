import { useNavigate } from 'react-router-dom';
import { PageIntroCard } from '@/components/ui/PageIntroCard';
import { Button } from '@/components/ui/primitives/Button';

const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="page-shell">
      <PageIntroCard
        className="mx-auto max-w-3xl"
        eyebrow="Dashboard"
        title="ログイン後ホーム"
        description="ログイン後に利用する画面への導線をまとめています。請求集計や手動メール取得はここから遷移してください。"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            fullWidth={false}
            className="w-full sm:w-auto"
            onClick={() => navigate('/billing-summary')}
          >
            請求集計を開く
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth={false}
            className="w-full sm:w-auto"
            onClick={() => navigate('/manual-mail-workflows')}
          >
            手動メール取得を開く
          </Button>
        </div>
      </PageIntroCard>
    </section>
  );
};

export default HomePage;
