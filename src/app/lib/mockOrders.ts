// mockOrders.ts
import type { Order } from '@/app/types/orders'

export const mockOrders: Order[] = [
    {
        id: "1",
        oa_number: "00001",
        account_code: "ACC001",
        account_name: "Acme Corporation",
        client_po: "PO-12345",
        order_date: "2026-01-10",
        req_pick_date: "2026-03-02",
        req_ship_date: "2026-03-04", // This week
        req_del_date: "2026-03-11",
        wh_pick_date: "2026-03-03",
        wh_ship_date: "2026-03-04",
        wh_del_date: "2026-03-11",
        status: "shipped",
        created_at: "2026-01-10T09:00:00Z"
    },
    {
        id: "2",
        oa_number: "00002",
        account_code: "ACC002",
        account_name: "TechStart Inc",
        client_po: "PO-67890",
        order_date: "2026-01-12",
        req_pick_date: "2026-03-04",
        req_ship_date: "2026-03-05", // This week
        req_del_date: "2026-03-12",
        wh_pick_date: "2026-03-04",
        wh_ship_date: "2026-03-05",
        wh_del_date: "2026-03-13",
        status: "shipped",
        created_at: "2026-01-12T14:30:00Z"
    },
    {
        id: "3",
        oa_number: "00003",
        account_code: "ACC003",
        account_name: "Global Industries",
        client_po: "PO-24680",
        order_date: "2026-01-15",
        req_pick_date: "2026-03-10",
        req_ship_date: "2026-03-11", // Next week
        req_del_date: "2026-03-18",
        wh_pick_date: "2026-03-10",
        wh_ship_date: "2026-03-11",
        wh_del_date: "2026-03-18",
        status: "picking",
        created_at: "2026-01-15T11:15:00Z"
    },
    {
        id: "4",
        oa_number: "00004",
        account_code: "ACC004",
        account_name: "Metro Supplies",
        client_po: "PO-13579",
        order_date: "2026-01-18",
        req_pick_date: "2026-03-05",
        req_ship_date: "2026-03-06", // This week
        req_del_date: "2026-03-13",
        wh_pick_date: "2026-03-05",
        wh_ship_date: "2026-03-06",
        wh_del_date: "2026-03-13",
        status: "pending",
        created_at: "2026-01-18T16:45:00Z"
    },
    {
        id: "5",
        oa_number: "00005",
        account_code: "ACC005",
        account_name: "Coastal Trading",
        client_po: "PO-97531",
        order_date: "2026-01-20",
        req_pick_date: "2026-03-11",
        req_ship_date: "2026-03-12", // Next week
        req_del_date: "2026-03-19",
        wh_pick_date: "2026-03-11",
        wh_ship_date: "2026-03-12",
        wh_del_date: "2026-03-19",
        status: "picking",
        created_at: "2026-01-20T10:00:00Z"
    },
    {
        id: "6",
        oa_number: "00006",
        account_code: "ACC001",
        account_name: "Acme Corporation",
        client_po: "PO-12346",
        order_date: "2026-01-22",
        req_pick_date: "2026-02-27",
        req_ship_date: "2026-02-28", // Last week
        req_del_date: "2026-03-06",
        wh_pick_date: "2026-02-27",
        wh_ship_date: "2026-02-28",
        wh_del_date: "2026-03-06",
        status: "shipped",
        created_at: "2026-01-22T13:20:00Z"
    },
    {
        id: "7",
        oa_number: "00007",
        account_code: "ACC006",
        account_name: "Valley Parts",
        client_po: "PO-11223",
        order_date: "2026-01-25",
        req_pick_date: "2026-03-03",
        req_ship_date: "2026-03-04", // This week
        req_del_date: "2026-03-11",
        wh_pick_date: "2026-03-03",
        wh_ship_date: "2026-03-04",
        wh_del_date: "2026-03-11",
        status: "shipped",
        created_at: "2026-01-25T09:30:00Z"
    },
    {
        id: "8",
        oa_number: "00008",
        account_code: "ACC007",
        account_name: "Summit Hardware",
        client_po: "PO-44556",
        order_date: "2026-01-28",
        req_pick_date: "2026-03-04",
        req_ship_date: "2026-03-05", // This week
        req_del_date: "2026-03-12",
        wh_pick_date: "2026-03-04",
        wh_ship_date: "2026-03-05",
        wh_del_date: "2026-03-12",
        status: "pending",
        created_at: "2026-01-28T15:10:00Z"
    },
    {
        id: "9",
        oa_number: "00009",
        account_code: "ACC008",
        account_name: "Pacific Distributors",
        client_po: "PO-77889",
        order_date: "2026-01-30",
        req_pick_date: "2026-03-12",
        req_ship_date: "2026-03-13", // Next week
        req_del_date: "2026-03-20",
        wh_pick_date: "2026-03-12",
        wh_ship_date: "2026-03-13",
        wh_del_date: "2026-03-20",
        status: "pending",
        created_at: "2026-01-30T11:45:00Z"
    },
    {
        id: "10",
        oa_number: "00010",
        account_code: "ACC002",
        account_name: "TechStart Inc",
        client_po: "PO-67891",
        order_date: "2026-02-01",
        req_pick_date: "2026-02-28",
        req_ship_date: "2026-03-01", // Last week
        req_del_date: "2026-03-08",
        wh_pick_date: "2026-02-28",
        wh_ship_date: "2026-03-01",
        wh_del_date: "2026-03-08",
        status: "shipped",
        created_at: "2026-02-01T14:00:00Z"
    },
    {
        id: "11",
        oa_number: "00011",
        account_code: "ACC009",
        account_name: "Eastern Supply",
        client_po: "PO-99001",
        order_date: "2026-02-03",
        req_pick_date: "2026-03-06",
        req_ship_date: "2026-03-07", // This week
        req_del_date: "2026-03-14",
        wh_pick_date: "2026-03-06",
        wh_ship_date: "2026-03-07",
        wh_del_date: "2026-03-14",
        status: "picking",
        created_at: "2026-02-03T10:30:00Z"
    },
    {
        id: "12",
        oa_number: "00012",
        account_code: "ACC010",
        account_name: "Northern Tool",
        client_po: "PO-22334",
        order_date: "2026-02-05",
        req_pick_date: "2026-03-13",
        req_ship_date: "2026-03-14", // Next week
        req_del_date: "2026-03-21",
        wh_pick_date: "2026-03-13",
        wh_ship_date: "2026-03-14",
        wh_del_date: "2026-03-21",
        status: "pending",
        created_at: "2026-02-05T16:20:00Z"
    },
    {
        id: "13",
        oa_number: "00013",
        account_code: "ACC003",
        account_name: "Global Industries",
        client_po: "PO-24681",
        order_date: "2026-02-07",
        req_pick_date: "2026-03-07",
        req_ship_date: "2026-03-08", // This week
        req_del_date: "2026-03-15",
        wh_pick_date: "2026-03-07",
        wh_ship_date: "2026-03-08",
        wh_del_date: "2026-03-15",
        status: "pending",
        created_at: "2026-02-07T09:15:00Z"
    },
    {
        id: "14",
        oa_number: "00014",
        account_code: "ACC011",
        account_name: "Southern Goods",
        client_po: "PO-55667",
        order_date: "2026-02-09",
        req_pick_date: "2026-02-28",
        req_ship_date: "2026-02-28", // Last week
        req_del_date: "2026-03-07",
        wh_pick_date: "2026-02-28",
        wh_ship_date: "2026-02-28",
        wh_del_date: "2026-03-07",
        status: "shipped",
        created_at: "2026-02-09T13:45:00Z"
    },
    {
        id: "15",
        oa_number: "00015",
        account_code: "ACC012",
        account_name: "Western Supply",
        client_po: "PO-88990",
        order_date: "2026-02-12",
        req_pick_date: "2026-03-03",
        req_ship_date: "2026-03-04", // This week
        req_del_date: "2026-03-11",
        wh_pick_date: "2026-03-03",
        wh_ship_date: "2026-03-04",
        wh_del_date: "2026-03-11",
        status: "shipped",
        created_at: "2026-02-12T11:00:00Z"
    },
    {
        id: "16",
        oa_number: "00016",
        account_code: "ACC004",
        account_name: "Metro Supplies",
        client_po: "PO-13580",
        order_date: "2026-02-14",
        req_pick_date: "2026-03-14",
        req_ship_date: "2026-03-15", // Next week
        req_del_date: "2026-03-22",
        wh_pick_date: "2026-03-14",
        wh_ship_date: "2026-03-15",
        wh_del_date: "2026-03-22",
        status: "picking",
        created_at: "2026-02-14T15:30:00Z"
    },
    {
        id: "17",
        oa_number: "00017",
        account_code: "ACC013",
        account_name: "Central Manufacturing",
        client_po: "PO-33445",
        order_date: "2026-02-16",
        req_pick_date: "2026-02-28",
        req_ship_date: "2026-03-01", // Last week
        req_del_date: "2026-03-08",
        wh_pick_date: "2026-02-28",
        wh_ship_date: "2026-03-01",
        wh_del_date: "2026-03-08",
        status: "shipped",
        created_at: "2026-02-16T10:45:00Z"
    },
    {
        id: "18",
        oa_number: "00018",
        account_code: "ACC014",
        account_name: "Premier Parts",
        client_po: "PO-66778",
        order_date: "2026-02-19",
        req_pick_date: "2026-03-05",
        req_ship_date: "2026-03-06", // This week
        req_del_date: "2026-03-13",
        wh_pick_date: "2026-03-05",
        wh_ship_date: "2026-03-06",
        wh_del_date: "2026-03-13",
        status: "pending",
        created_at: "2026-02-19T14:15:00Z"
    },
    {
        id: "19",
        oa_number: "00019",
        account_code: "ACC015",
        account_name: "Allied Products",
        client_po: "PO-99887",
        order_date: "2026-02-21",
        req_pick_date: "2026-03-11",
        req_ship_date: "2026-03-12", // Next week
        req_del_date: "2026-03-19",
        wh_pick_date: "2026-03-11",
        wh_ship_date: "2026-03-12",
        wh_del_date: "2026-03-19",
        status: "pending",
        created_at: "2026-02-21T12:00:00Z"
    },
    {
        id: "20",
        oa_number: "00020",
        account_code: "ACC001",
        account_name: "Acme Corporation",
        client_po: "PO-12347",
        order_date: "2026-02-23",
        req_pick_date: "2026-03-06",
        req_ship_date: "2026-03-07", // This week
        req_del_date: "2026-03-14",
        wh_pick_date: "2026-03-06",
        wh_ship_date: "2026-03-07",
        wh_del_date: "2026-03-14",
        status: "picking",
        created_at: "2026-02-23T09:30:00Z"
    }
]