const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const User = require('../models/User');

// Export Orders to Excel
router.post('/export-orders', async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.body;
    
    // Build query
    let query = {};
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    if (status) {
      query.orderStatus = status;
    }
    
    // Fetch orders
    const orders = await Order.find(query).populate('userId');
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    
    // Define columns
    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Email', key: 'customerEmail', width: 25 },
      { header: 'Phone', key: 'customerPhone', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Shipping', key: 'shippingCharge', width: 12 },
      { header: 'Total Amount', key: 'totalAmount', width: 12 },
      { header: 'Status', key: 'orderStatus', width: 12 },
      { header: 'Order Date', key: 'orderDate', width: 12 },
      { header: 'Shipping Date', key: 'shippingDate', width: 12 },
      { header: 'Est. Delivery', key: 'estimatedDeliveryDate', width: 12 },
      { header: 'Actual Delivery', key: 'deliveryDate', width: 12 },
      { header: 'Items', key: 'itemsCount', width: 10 },
      { header: 'Address', key: 'address', width: 30 }
    ];
    
    // Format header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228a3a' } };
    
    // Add data
    orders.forEach(order => {
      const shippingAddress = order.shippingAddress;
      const address = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}`;
      
      worksheet.addRow({
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        subtotal: `₹${order.subtotal}`,
        shippingCharge: `₹${order.shippingCharge}`,
        totalAmount: `₹${order.totalAmount}`,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate?.toLocaleDateString(),
        shippingDate: order.shippingDate?.toLocaleDateString() || 'N/A',
        estimatedDeliveryDate: order.estimatedDeliveryDate?.toLocaleDateString() || 'N/A',
        deliveryDate: order.deliveryDate?.toLocaleDateString() || 'N/A',
        itemsCount: order.items.length,
        address
      });
    });
    
    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    
    summarySheet.addRow({ metric: 'Total Orders', value: orders.length });
    summarySheet.addRow({ metric: 'Total Revenue', value: `₹${totalRevenue}` });
    summarySheet.addRow({ metric: 'Delivered Orders', value: deliveredOrders });
    summarySheet.addRow({ metric: 'Pending Orders', value: pendingOrders });
    summarySheet.addRow({ metric: 'Export Date', value: new Date().toLocaleDateString() });
    
    // Generate Excel file
    const fileName = `Orders_Export_${new Date().getTime()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export User Orders to Excel
router.post('/export-user-orders/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const orders = await Order.find({ userId: req.params.userId });
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Orders');
    
    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 15 },
      { header: 'Items', key: 'items', width: 30 },
      { header: 'Amount', key: 'totalAmount', width: 12 },
      { header: 'Status', key: 'orderStatus', width: 12 },
      { header: 'Order Date', key: 'orderDate', width: 12 },
      { header: 'Shipping Date', key: 'shippingDate', width: 12 },
      { header: 'Delivery Date', key: 'deliveryDate', width: 12 }
    ];
    
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228a3a' } };
    
    orders.forEach(order => {
      const itemsList = order.items.map(item => `${item.productName} (x${item.quantity})`).join(', ');
      
      worksheet.addRow({
        orderId: order.orderId,
        items: itemsList,
        totalAmount: `₹${order.totalAmount}`,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate?.toLocaleDateString(),
        shippingDate: order.shippingDate?.toLocaleDateString() || 'N/A',
        deliveryDate: order.deliveryDate?.toLocaleDateString() || 'N/A'
      });
    });
    
    const fileName = `Orders_${user.firstName}_${new Date().getTime()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
