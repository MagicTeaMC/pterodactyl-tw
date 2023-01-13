import { useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import createServerDatabase from '@/api/server/databases/createServerDatabase';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';

interface Values {
    databaseName: string;
    connectionsFrom: string;
}

const schema = object().shape({
    databaseName: string()
        .required('必須提供資料庫名稱。')
        .min(3, '資料庫名稱必須至少為 3 個字元。')
        .max(48, '資料庫名稱不得超過 48 個字元。')
        .matches(/^[\w\-.]{3,48}$/, '資料庫名稱應僅包含字母數位字元 底線_ 破折號和 / 或半拼句號。'),
    connectionsFrom: string().matches(/^[\w\-/.%:]+$/, '必須提供有效的連接位址。'),
});

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions(actions => actions.databases.appendDatabase);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('database:create');
        createServerDatabase(uuid, {
            databaseName: values.databaseName,
            connectionsFrom: values.connectionsFrom || '%',
        })
            .then(database => {
                appendDatabase(database);
                setVisible(false);
            })
            .catch(error => {
                addError({ key: 'database:create', message: httpErrorToHuman(error) });
                setSubmitting(false);
            });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ databaseName: '', connectionsFrom: '' }}
                validationSchema={schema}
            >
                {({ isSubmitting, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            resetForm();
                            setVisible(false);
                        }}
                    >
                        <FlashMessageRender byKey={'database:create'} css={tw`mb-6`} />
                        <h2 css={tw`text-2xl mb-6`}>創建新資料庫</h2>
                        <Form css={tw`m-0`}>
                            <Field
                                type={'string'}
                                id={'database_name'}
                                name={'databaseName'}
                                label={'資料庫名'}
                                description={'資料庫實例的描述性名稱。'}
                            />
                            <div css={tw`mt-6`}>
                                <Field
                                    type={'string'}
                                    id={'connections_from'}
                                    name={'connectionsFrom'}
                                    label={'連接白名單'}
                                    description={
                                        '允許哪些IP位址可以連接至此資料庫，留空表示允許任何IP位址連接到此資料庫。'
                                    }
                                />
                            </div>
                            <div css={tw`flex flex-wrap justify-end mt-6`}>
                                <Button
                                    type={'button'}
                                    isSecondary
                                    css={tw`w-full sm:w-auto sm:mr-2`}
                                    onClick={() => setVisible(false)}
                                >
                                    取消
                                </Button>
                                <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'}>
                                    創建資料庫
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Button onClick={() => setVisible(true)}>新資料庫</Button>
        </>
    );
};

