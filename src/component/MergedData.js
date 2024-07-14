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
            <div className="table-wrapper">
                <table className="sapling-table">
                    <thead>
                        <tr>
                            <th rowSpan="2" className="sticky-col">WAREHOUSE NAME</th>
                            {saplingNames.map((saplingName, index) => (
                                <th key={index} colSpan="3">{saplingName}</th>
                            ))}
                        </tr>
                        <tr>
                            {saplingNames.map((_, index) => (
                                <React.Fragment key={`subheader-${index}`}>
                                    <th>Total Stock</th>
                                    <th>Total Distribute</th>
                                    <th>Balance Stock</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mergedData.map(([warehouseName, warehouseData], index) => (
                            <tr key={index}>
                                <td className="sticky-col">{warehouseName}</td>
                                {saplingNames.map((saplingName, index) => {
                                    const saplingData = warehouseData.saplings[saplingName] || {};
                                    return (
                                        <React.Fragment key={index}>
                                            <td>{saplingData.sum_sapling_inward || 0}</td>
                                            <td>{saplingData.sum_sapling_outward || 0}</td>
                                            <td className={`balance-stock ${saplingData.sapling_balance_stock > 0 ? 'positive' : 'negative'}`}>
                                                {saplingData.sapling_balance_stock || 0}
                                            </td>
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MergedData;
