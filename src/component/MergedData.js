import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MergedData.css';

const MergedData = () => {
    const [mergedData, setMergedData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const saplingsMasterResponse = await axios.get(`${process.env.PUBLIC_URL}/saplings_master.json`);
                const saplingInwardOutwardResponse = await axios.get(`${process.env.PUBLIC_URL}/saplinginwardoutward.json`);

                const saplingsMaster = saplingsMasterResponse.data;
                const saplingInwardOutward = saplingInwardOutwardResponse.data;

                const saplingsDict = saplingsMaster.reduce((acc, sapling) => {
                    acc[sapling.saplings_code] = sapling;
                    return acc;
                }, {});

                const mergedDataByWarehouse = saplingInwardOutward.sapling_stock_res_by_warehouse.map(stock => {
                    const saplingInfo = saplingsDict[stock.sapling_item_code];
                    return {
                        saplings_name: saplingInfo.saplings_name,
                        saplings_code: saplingInfo.saplings_code,
                        warehouse_name: stock.warehouse_name,
                        warehouse_code: stock.warehouse_code,
                        sum_sapling_inward: stock.sum_sapling_inward,
                        sum_sapling_outward: stock.sum_sapling_outward,
                        sapling_balance_stock: stock.sapling_balance_stock
                    };
                });

                const mergedDataBySapling = saplingInwardOutward.sapling_stock_res_by_sapling.map(stock => {
                    const saplingInfo = saplingsDict[stock.sapling_item_code];
                    return {
                        saplings_name: saplingInfo.saplings_name,
                        saplings_code: saplingInfo.saplings_code,
                        sum_sapling_inward: stock.sum_sapling_inward,
                        sum_sapling_outward: stock.sum_sapling_outward,
                        sapling_balance_stock: stock.sapling_balance_stock
                    };
                });

                setMergedData([...mergedDataByWarehouse, ...mergedDataBySapling]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="merged-data-container">
            <h1>Sapling Inventory</h1>
            <table>
                <thead>
                    <tr>
                        <th>Saplings Name</th>
                        <th>Saplings Code</th>
                        <th>Warehouse Name</th>
                        <th>Warehouse Code</th>
                        <th>Sum Sapling Inward</th>
                        <th>Sum Sapling Outward</th>
                        <th>Sapling Balance Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {mergedData.map((data, index) => (
                        <tr key={index}>
                            <td>{data.saplings_name}</td>
                            <td>{data.saplings_code}</td>
                            <td>{data.warehouse_name || '-'}</td>
                            <td>{data.warehouse_code || '-'}</td>
                            <td>{data.sum_sapling_inward}</td>
                            <td>{data.sum_sapling_outward}</td>
                            <td>{data.sapling_balance_stock}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MergedData;
