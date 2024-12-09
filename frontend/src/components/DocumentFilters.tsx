import React from 'react';
import { Form, Select, Space, Card, Collapse } from 'antd';

const { Panel } = Collapse;

interface DocumentFiltersProps {
    onFilterChange: (filters: any) => void;
    museums: Array<{ id: string; name: string }>;
    founders: Array<{ id: string; name: string }>;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({ 
    onFilterChange, 
    museums, 
    founders 
}) => {
    const [form] = Form.useForm();

    const handleFilterChange = (changedValues: any, allValues: any) => {
        const filters: any = {};
        
        if (allValues.museum?.length) {
            filters.museum = allValues.museum;
        }
        if (allValues.founder?.length) {
            filters.founder = allValues.founder;
        }
        
        onFilterChange(filters);
    };

    return (
        <Card>
            <Form 
                form={form}
                layout="vertical"
                onValuesChange={handleFilterChange}
            >
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="Фильтры" key="1">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Form.Item name="museum" label="Музей">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Выберите музей"
                                    style={{ width: '100%' }}
                                >
                                    {museums.map(museum => (
                                        <Select.Option key={museum.id} value={museum.id}>
                                            {museum.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="founder" label="Учредитель">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Выберите учредителя"
                                    style={{ width: '100%' }}
                                >
                                    {founders.map(founder => (
                                        <Select.Option key={founder.id} value={founder.id}>
                                            {founder.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Space>
                    </Panel>
                </Collapse>
            </Form>
        </Card>
    );
};