const Category = require("../model/categoryModel")

const createCategory = async(req, res) => {
    try{
        const { title } = req.body;

        const newCategory = new Category({
            title,
            userId : req.userId,
            isDefault: false
        })

        const savedCategory = await newCategory.save()
        res.status(201).json(savedCategory)

    } catch (error) {
        res.status(500).json({
            message : "Couldn't create the category",
            error : error.message
        })
    }
};

const getCategories = async(req, res) => {
    try{
        const categories = await Category.find({
            $or: [
                { isDefault: true },
                { userId: req.userId }
            ]
        })

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
            error : error.message
        })
    }
};

const getCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({
            _id: id,
            $or: [
                { isDefault: true },
                { userId: req.userId }
            ]
        });

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
            error : error.message
        })
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCategory = await Category.findOneAndUpdate({
                _id: id,
                userId: req.userId,
                isDefault: false
            },
            {
                title: req.body.title
            },
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
            error : error.message
        })
    }
};

const deleteCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findOneAndDelete({
            _id: id,
            userId: req.userId,
            isDefault: false
        });

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
            error : error.message
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