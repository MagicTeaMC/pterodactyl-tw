import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import { ServerContext } from '@/state/server';
import { join } from 'path';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

type Props = RequiredModalProps & {
    onFileNamed: (name: string) => void;
};

interface Values {
    fileName: string;
}

export default ({ onFileNamed, onDismissed, ...props }: Props) => {
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        onFileNamed(join(directory, values.fileName));
        setSubmitting(false);
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{ fileName: '' }}
            validationSchema={object().shape({
                fileName: string().required().min(1),
            })}
        >
            {({ resetForm }) => (
                <Modal
                    onDismissed={() => {
                        resetForm();
                        onDismissed();
                    }}
                    {...props}
                >
                    <Form>
                        <Field
                            id={'fileName'}
                            name={'fileName'}
                            label={'檔案名稱'}
                            description={'輸入儲存的檔案名稱'}
                            autoFocus
                        />
                        <div css={tw`mt-6 text-right`}>
                            <Button>新建檔案</Button>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};
