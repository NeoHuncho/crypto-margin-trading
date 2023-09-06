import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import AccountOverview from '~/components/dashboard/accountOverview';
import CoinsOverview from '~/components/dashboard/coinsOverview';
import Onboarding from '~/components/dashboard/onboarding';
import NavbarComponent from '~/components/navbar/navbar';
import { api } from '~/utils/api';

export default function Dashboard() {
    const { data: sessionData,status } = useSession();
    const {data, isLoading,refetch}= api.user.getUserExchangeName.useQuery({userId: sessionData?.user.id ?? ""}, {
      enabled: !!sessionData,
    });
    const router =useRouter();

    useEffect(()=>{
      if(!sessionData && status!=='loading'){
        void router.push("/")
      }
    }, [sessionData,router,status])

    const refetchData=()=>{
      void refetch();
    }
  return (
    <main className=" flex min-h-screen flex-col  bg-black">
      <NavbarComponent/>    
      {!data?.exchangeName && !isLoading && (
        <Onboarding refetch={refetchData} />
      )}
      {data?.exchangeName && (
        <div className='flex flex-col items-center justify-center pt-2 gap-20 '>
          <AccountOverview/>
          <CoinsOverview/>
        </div>
      )}
    </main>
    
  )
}
