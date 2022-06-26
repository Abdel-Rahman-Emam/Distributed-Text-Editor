const mongoose = require("mongoose")
const Document = require("./Document")
const dbURI = 'mongodb+srv://user:test123456@gdocs.lajw6.mongodb.net/GDocs'
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const io = require("socket.io")( process.env.PORT || 3001 , {

  cors: {
    'Access-Control-Allow-Origin' : '*',
    origin: process.env.PORT ||"http://localhost:3000" || "http://192.168.100.10:3000" , 
  },
})
const defaultValue = ""
io.on("connection", socket => { 
  socket.on("get-document", async documentId => { 
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data) 

    socket.on("send-changes", delta => { 
      socket.broadcast.to(documentId).emit("receive-changes", delta) 
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data }) 
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id) 
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
