const Category = require("../model/categoryModel")

const createCategory = async(req, res) => {
    try{
        const { title } = req.body;

        const newCategory = new Category({
            title
        })

        const savedCategory = await newCategory.save()
        res.status(201).json(savedCategory)

    } catch (error) {
        res.status(500).json({
            message : "Couldn't create the category",
            error : message.error
        })
    }
};

const getCategories = async(req, res) => {
    try{
        const categories = await Category.find()

        if(!categories) {
            return res.status(404).json({
                message : "No categories found"
            })
        }

        res.status(200).json({
            categories
        })

    } catch (error){
        res.status(500).json({
            message : "Couldn't get categories",
            error : message.error
        })
    }
};

const getCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if(!category) {
            return res.status(404).json({
                message : "No category"
            })
        }

        res.status(200).json({
            category
        })

    } catch (error) {
        res.status(500).json({
            message : "Could't load category",
            error : message.error
        })
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!updatedCategory) {
            return res.status(404).json({
                message : "No category found"
            })
        }

        res.status(200).json(updatedCategory)

    } catch (error) {
        res.status(500).json({
            message : "Couldn't update category",
            error : message.error
        })
    }
};

const deleteCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if(!deletedCategory) {
            return res.status(404).json({
                message : "Couldn't find category"
            })
        }

        res.status(200).json({
            "deletedCategory" : { deletedCategory }
        })

    } catch(error) {
        res.status(500).json({
            message : "Couldn't delete category",
            error : message.error
        })
    }
}




module.exports = {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory
}