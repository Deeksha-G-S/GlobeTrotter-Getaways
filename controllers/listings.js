const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res,next) => {
  const filterList = [
    {icon: "fa-solid fa-fire", text: "Trending"},
    {icon: "fa-solid fa-bed", text: "Rooms"},
    {icon: "fa-solid fa-mountain-city", text: "Iconic Cities"},
    {icon: "fa-solid fa-mountain", text: "Mountains"},
    {icon: "fa-brands fa-fort-awesome", text: "Castles"},
    {icon: "fa-solid fa-umbrella-beach", text: "Beach"},
    {icon: "fa-solid fa-campground", text: "Camping"},
    {icon: "fa-solid fa-cow", text: "Farms"},
    {icon: "fa-solid fa-igloo", text: "Arctic"},
    {icon: "fa-solid fa-person-swimming", text: "Amazing Pools"},
  
];
  const allListings=await Listing.find({});
  res.render("listings/index.ejs",{allListings,filterList});
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
  // let coordinate = await geocodingClient
  //   .forwardGeocode({
  //     query: `${req.body.listing.location},${req.body.listing.country}`,
  //     limit: 2,
  //   })
  //   .send();
  
  let {location} = req.body.listing;

    // Get Coordinates
    const data = await fetch("https://geocode.maps.co/search?q="+location.split(", ").join("+")+"&api_key=668cdc66180b5425798827zyxafe37a");
    const json = await data.json();
    let {lon, lat} = json[0];

  let url = req.file.path;
  let filename = req.file.filename;
  let listing = req.body.listing;
  const newListing=new Listing(listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = {type: 'Point', coordinates: [lon, lat]};
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