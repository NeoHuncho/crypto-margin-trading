import { Card, CardBody } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import TextAndLabel from '../common/textAndLabel';

export default function AccountOverview() {
    const { data: sessionData,status } = useSession();
    const {data:accountData}= api.binance.getBinanceAccountInformation.useQuery({userId:sessionData?.user.id ?? "" });
    
    if(!accountData) return null;
  return (
 <Card className='w-fit'>
  <CardBody>
    <h1 className='mb-6 text-xl font-semibold text-center'>Account Overview</h1>
    <div className='flex items-center justify-center gap-10'>
    <TextAndLabel label={'currently invested'} text={accountData.totalNetAssetOfBtc}/>
    <TextAndLabel label={'Risk Ratio'} text={accountData.marginLevel}/>
    </div>
  </CardBody>
 </Card>
  )
}
