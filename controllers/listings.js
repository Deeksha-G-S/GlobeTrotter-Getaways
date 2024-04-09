const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res,next) => {
  const allListings=await Listing.find({});
  res.render("listings/index.ejs",{allListings});
};

module.exports.new = (req,res)=>{
  res.render("listings/new.ejs");
  };

module.exports.show = async (req, res) => {
 
  let {id}=req.params;
  let listing = await Listing.findById(id)
.populate({ path: "reviews", populate: {path: "author"} })
.populate("owner");
   if(!listing){
      req.flash('error', 'Listing you requested does not exist');
      res.redirect("/listings");
   }
   res.render("listings/show.ejs",{listing});
};

module.exports.create = async (req, res, next) => {
  let coordinate = await geocodingClient
    .forwardGeocode({
      query: `${req.body.listing.location},${req.body.listing.country}`,
      limit: 2,
    })
    .send();
  let url = req.file.path;
  let filename = req.file.filename;
  let listing = req.body.listing;
  const newListing=new Listing(listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = coordinate.body.features[0].geometry;
    await newListing.save();
    req.flash('success', 'Successfully created a new listing');
    res.redirect("/listings");
};

module.exports.edit = async (req, res,next) => {
  let { id }=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Listing you requested does not exist');
        res.redirect("/listings");
     }
    //res.render("listings/edit.ejs",{listing});
    let orignalImage = listing.image.url;
  let bluredImage = orignalImage.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, bluredImage });
};

module.exports.update = async (req, res,next) => {
  let { id }=req.params;
   let updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    updatedListing.save();
  }
   req.flash('success', 'Listing updated');
res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res,next) => {
  let { id }=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted');
    res.redirect("/listings");
};