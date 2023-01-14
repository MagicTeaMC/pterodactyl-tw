import { useContext, useEffect } from 'react';
import { Schedule, Task } from '@/api/server/schedules/getServerSchedules';
import { Field as FormikField, Form, Formik, FormikHelpers, useField } from 'formik';
import { ServerContext } from '@/state/server';
import createOrUpdateScheduleTask from '@/api/server/schedules/createOrUpdateScheduleTask';
import { httpErrorToHuman } from '@/api/http';
import Field from '@/components/elements/Field';
import FlashMessageRender from '@/components/FlashMessageRender';
import { boolean, number, object, string } from 'yup';
import useFlash from '@/plugins/useFlash';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import { Textarea } from '@/components/elements/Input';
import { Button } from '@/components/elements/button/index';
import Select from '@/components/elements/Select';
import ModalContext from '@/context/ModalContext';
import asModal from '@/hoc/asModal';
import FormikSwitch from '@/components/elements/FormikSwitch';

interface Props {
    schedule: Schedule;
    // If a task is provided we can assume we're editing it. If not provided,
    // we are creating a new one.
    task?: Task;
}

interface Values {
    action: string;
    payload: string;
    timeOffset: string;
    continueOnFailure: boolean;
}

const schema = object().shape({
    action: string().required().oneOf(['command', 'power', 'backup']),
    payload: string().when('action', {
        is: (v: string) => v !== 'backup',
        then: string().required('必須提供有效的任務操作。'),
        otherwise: string(),
    }),
    continueOnFailure: boolean(),
    timeOffset: number()
        .typeError('時間偏移必須是 0 到 900 之間的有效數字。')
        .required('必須提供時間偏移值。')
        .min(0, '時間偏移至少為 0 秒。')
        .max(900, '時間偏移必須小於 900 秒。'),
});

const ActionListener = () => {
    const [{ value }, { initialValue: initialAction }] = useField<string>('action');
    const [, { initialValue: initialPayload }, { setValue, setTouched }] = useField<string>('payload');

    useEffect(() => {
        if (value !== initialAction) {
            setValue(value === 'power' ? 'start' : '');
            setTouched(false);
        } else {
            setValue(initialPayload || '');
            setTouched(false);
        }
    }, [value]);

    return null;
};

const TaskDetailsModal = ({ schedule, task }: Props) => {
    const { dismiss } = useContext(ModalContext);
    const { clearFlashes, addError } = useFlash();

    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions(actions => actions.schedules.appendSchedule);
    const backupLimit = ServerContext.useStoreState(state => state.server.data!.featureLimits.backups);

    useEffect(() => {
        return () => {
            clearFlashes('schedule:task');
        };
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:task');
        if (backupLimit === 0 && values.action === 'backup') {
            setSubmitting(false);
            addError({
                message: '當伺服器的備份限制設置為 0 時，無法創建備份任務。',
                key: 'schedule:task',
            });
        } else {
            createOrUpdateScheduleTask(uuid, schedule.id, task?.id, values)
                .then(task => {
                    let tasks = schedule.tasks.map(t => (t.id === task.id ? task : t));
                    if (!schedule.tasks.find(t => t.id === task.id)) {
                        tasks = [...tasks, task];
                    }

                    appendSchedule({ ...schedule, tasks });
                    dismiss();
                })
                .catch(error => {
                    console.error(error);
                    setSubmitting(false);
                    addError({ message: httpErrorToHuman(error), key: 'schedule:task' });
                });
        }
    };

    return (
        <Formik
            onSubmit={submit}
            validationSchema={schema}
            initialValues={{
                action: task?.action || 'command',
                payload: task?.payload || '',
                timeOffset: task?.timeOffset.toString() || '0',
                continueOnFailure: task?.continueOnFailure || false,
            }}
        >
            {({ isSubmitting, values }) => (
                <Form css={tw`m-0`}>
                    <FlashMessageRender byKey={'schedule:task'} css={tw`mb-4`} />
                    <h2 css={tw`text-2xl mb-6`}>{task ? '編輯任務' : '創建任務'}</h2>
                    <div css={tw`flex`}>
                        <div css={tw`mr-2 w-1/3`}>
                            <Label>動作</Label>
                            <ActionListener />
                            <FormikFieldWrapper name={'action'}>
                                <FormikField as={Select} name={'action'}>
                                    <option value={'command'}>發送指令</option>
                                    <option value={'power'}>發送電源操作</option>
                                    <option value={'backup'}>創建備份</option>
                                </FormikField>
                            </FormikFieldWrapper>
                        </div>
                        <div css={tw`flex-1 ml-6`}>
                            <Field
                                name={'timeOffset'}
                                label={'時間偏移（以秒為單位）'}
                                description={
                                    '上一個任務執行後在運行此任務之前等待的時間。如果這是計畫中的第一個任務，則不會應用該任務。'
                                }
                            />
                        </div>
                    </div>
                    <div css={tw`mt-6`}>
                        {values.action === 'command' ? (
                            <div>
                                <Label>任務操作</Label>
                                <FormikFieldWrapper name={'payload'}>
                                    <FormikField as={Textarea} name={'payload'} rows={6} />
                                </FormikFieldWrapper>
                            </div>
                        ) : values.action === 'power' ? (
                            <div>
                                <Label>任務操作</Label>
                                <FormikFieldWrapper name={'payload'}>
                                    <FormikField as={Select} name={'payload'}>
                                        <option value={'start'}>啟動伺服器</option>
                                        <option value={'restart'}>重啟伺服器</option>
                                        <option value={'stop'}>關閉伺服器</option>
                                        <option value={'kill'}>停止伺服器</option>
                                    </FormikField>
                                </FormikFieldWrapper>
                            </div>
                        ) : (
                            <div>
                                <Label>被忽略的文件</Label>
                                <FormikFieldWrapper
                                    name={'payload'}
                                    description={
                                        '可選的。包括要在此備份中排除的檔和資料夾。預設情況下，將使用 .pteroignore 檔的內容。如果您已達到備份限制，則將輪換最早的備份。'
                                    }
                                >
                                    <FormikField as={Textarea} name={'payload'} rows={6} />
                                </FormikFieldWrapper>
                            </div>
                        )}
                    </div>
                    <div css={tw`mt-6 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded`}>
                        <FormikSwitch
                            name={'continueOnFailure'}
                            description={'當此任務失敗時，將運行未來的任務。'}
                            label={'即使失敗也繼續執行'}
                        />
                    </div>
                    <div css={tw`flex justify-end mt-6`}>
                        <Button type={'submit'} disabled={isSubmitting}>
                            {task ? '保存更改' : '創建任務'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default asModal<Props>()(TaskDetailsModal);

