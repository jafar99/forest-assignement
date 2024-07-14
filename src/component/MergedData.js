import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MergedData.css';

const MergedData = () => {
    const [mergedData, setMergedData] = useState([]);
    const [saplingNames, setSaplingNames] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const saplingsMasterResponse = await axios.get(`${process.env.PUBLIC_URL}/saplings_master.json`);
                const saplingInwardOutwardResponse = await axios.get(`${process.env.PUBLIC_URL}/saplinginwardoutward.json`);

                const saplingsMaster = saplingsMasterResponse.data;
                const saplingInwardOutward = saplingInwardOutwardResponse.data;

                // Extract sapling names from saplings_master.json
                const saplingNames = saplingsMaster.map(sapling => sapling.saplings_name);
                setSaplingNames(saplingNames);

                const saplingsDict = saplingsMaster.reduce((acc, sapling) => {
                    acc[sapling.saplings_code] = sapling.saplings_name;
                    return acc;
                }, {});

                // Group data by warehouse
                const mergedDataByWarehouse = saplingInwardOutward.sapling_stock_res_by_warehouse.reduce((acc, stock) => {
                    if (!acc[stock.warehouse_name]) {
                        acc[stock.warehouse_name] = { warehouse_code: stock.warehouse_code, saplings: {} };
                    }
                    const saplingName = saplingsDict[stock.sapling_item_code];
                    acc[stock.warehouse_name].saplings[saplingName] = {
                        sum_sapling_inward: stock.sum_sapling_inward,
                        sum_sapling_outward: stock.sum_sapling_outward,
                        sapling_balance_stock: stock.sapling_balance_stock
                    };
                    return acc;
                }, {});

                setMergedData(Object.entries(mergedDataByWarehouse));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="merged-data-container">
            <h2>Sapling stock by warehouse</h2>
            <table className="sapling-table">
                <thead>
                    <tr>
                        <th>WAREHOUSE NAME</th>
                        {saplingNames.map((saplingName, index) => (
                            <th key={index}>{saplingName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {mergedData.map(([warehouseName, warehouseData], index) => (
                        <tr key={index}>
                            <td>{warehouseName}</td>
                            {saplingNames.map((saplingName, index) => {
                                const saplingData = warehouseData.saplings[saplingName] || {};
                                return (
                                    <td key={index}>
                                        <div className="stock-info">Total Stock: {saplingData.sum_sapling_inward || 0}</div>
                                        <div className="stock-info">Total Distribute: {saplingData.sum_sapling_outward || 0}</div>
                                        <div className={`balance-stock ${saplingData.sapling_balance_stock > 0 ? 'positive' : 'negative'}`}>
                                            Balance Stock:
                                             {saplingData.sapling_balance_stock || 0}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MergedData;
