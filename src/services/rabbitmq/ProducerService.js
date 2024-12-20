const amqp = require('amqplib');
const config = require('../../utils/config/config');

const ProducerService = {
    sendMessage: async (queue, message) => {
        const connection = await amqp.connect(config.rabbitMq.host);
        const producer = await connection.createChannel();

        await producer.assertQueue(queue, {
            durable: true,
        });

        producer.sendToQueue(queue, Buffer.from(message));
        setTimeout(() => {
            connection.close();
        }, 1000);
    },
};

module.exports = ProducerService;
